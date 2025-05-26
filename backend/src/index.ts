import { Hono } from 'hono'
import { userRouter } from './routes/user'
import { blogRouter } from './routes/blog';
import { cors } from 'hono/cors';
import { ai } from './utils/ai';


const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
    HF_API_TOKEN : string
  }
}>()




app.use('/api/*', cors())
app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);
app.route("/api/v1/ai", ai);

// app.use('/api/v1/blog/*', async (c, next)=>{
//   const header= c.req.header("Authorization");
//   if(!header){
//     c.status(401);
//     return c.json({error: "unauthorized"});
//     }
//     const token= header.split(' ')[1];
//     const payload= await verify(token, c.env.JWT_SECRET);
//     if(!payload){
//       c.status(401);
//       return c.json({error:"unauthorized"});
//     }
//     c.set( payload.id);
//     await next()
//   })

console.log('/api/v1/ai/generate');

export default app
