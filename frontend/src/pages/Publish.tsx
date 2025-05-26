import { AppBar } from "../components/AppBar";
import axios from "axios";
import { BACKEND_URL } from "../config";
import React, { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";


export const Publish = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isloading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleAIGeneration = async (prompt: string) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/ai/generate`,
                { prompt },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
            console.log(response);
            const aiResponse = response.data.generated_text;
            console.log(aiResponse);
            setDescription(prev => {
                const lines = prev.split('\n');
                lines.pop();
                return [...lines, aiResponse].join('\n')
            });
        } catch (error) {
            console.error("Error generating AI response:", error)
        } finally {
            setIsLoading(false);
        }
    }

    const handleKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            const cursorPosition = event.currentTarget.selectionStart;
            const textBeforeCursor = description.slice(0, cursorPosition);
            const lines = textBeforeCursor.split('\n');
            const lastLine = lines[lines.length - 1];

            if (lastLine.startsWith('@ai')) {
                const prompt = lastLine.slice(3).trim();
                if (prompt) {
                    await handleAIGeneration(prompt);
                }
            } else {
                setDescription(prev => prev + '\n');
            }
        }
    }


    return (<div>
        <AppBar />
        <div className="flex justify-center w-full pt-8">
            <div className="max-w-screen-lg w-full">
                <input onChange={(e) => {
                    setTitle(e.target.value)
                }} type="text" className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="title" />
                <TextEditor
                    value={description}
                    onChange={(e) => {
                        setDescription(e.target.value)
                    }}
                    onKey={(e) => { handleKeyDown(e) }}
                    isLoading={isloading}
                />
                <button onClick={async () => {
                    const response = await axios.post(`${BACKEND_URL}/api/v1/blog`, {
                        title,
                        content: description
                    }, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    });
                    navigate(`/blog/${response.data.id}`)
                }} type="submit" className="mt-4 inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800">Publish Post</button>

            </div>
        </div>
    </div>
    )
}
interface TextEditorProps {
    value: string;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    onKey: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    isLoading: boolean;
}
function TextEditor({ value, onChange, onKey, isLoading }: TextEditorProps) {
    return <div className="mt-2">
        <div className="w-full mb-4">
            <div className="flex items-center justify-between border">
                <div className="my-2 bg-white rounded-b-lg w-full">
                    <label className="sr-only">Publish Post</label>
                    <textarea
                        disabled={isLoading}
                        value={isLoading ? value + " Generating..." : value}
                        onChange={onChange}
                        onKeyDown={onKey} id="editor" rows={8} className="focus:outline-none block pl-2 w-full px-0 text-sm text-gray-800 bg-white border-0" placeholder="Write an article... Type @ai to generate ai response" required></textarea>
                </div>
            </div>

        </div>
    </div>
}

