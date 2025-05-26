import { HfInference } from '@huggingface/inference';
import { Hono } from 'hono';
import { verify } from "hono/jwt";
const app = new Hono();
export const ai = new Hono<{
    Bindings: {
        JWT_SECRET: string;
        HF_API_TOKEN: string;
    }, Variables: {
        userId: string
    }

}>

ai.use("/*", async (c, next) => {
    const authHeader = c.req.header("authorization") || "";
    const token = authHeader.split(' ')[1]
    try {
        const user = await verify(token, c.env.JWT_SECRET);
        if (user) {
            c.set("userId", user.id as string)
            await next();
            return c.json({
                id: user.id
            })

        } else {
            c.status(403);
            return c.json({
                message: "You are not logged in"
            })
        }
    } catch (e) {
        console.log(e)
        c.status(403);
        return c.json({
            message: "You are not logged in"
        })
    }
});


ai.post("/generate", async (c) => {
    console.log('Received request to /generate');

    // Check if the API token is set
    if (!c.env.HF_API_TOKEN) {
        console.error('HF_API_TOKEN is not set in the environment');
        return c.json({ error: "API token is not configured" }, 500);
    }
    
    const hf = new HfInference(c.env.HF_API_TOKEN);
    const { prompt } = await c.req.json();
    console.log('Received prompt:', prompt)
    try {
        console.log('Attempting to generate text...');
        const result = await hf.textGeneration({
            model: "gpt2",
            inputs: prompt,
            parameters: {
                max_new_tokens: 50,
                temperature: 0.7,
            }
        });
        console.log('Text generation successful');
        return c.json(
            { generated_text: result.generated_text }
        );
    }
    catch (e) {
        console.error("Error in text generation", e);
        return c.json({ error: "An error occured during text generation" })
    }
})