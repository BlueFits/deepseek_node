import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import winston from 'winston';
import { ElevenLabsClient, play, stream } from "elevenlabs";


const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

export class OllamaController {
    async getChatResponse(req: Request, res: Response, next: NextFunction) {
        try {
            const response = await axios.post(`http://${process.env.ENV === "dev" ? "localhost" : "ollama"}:11434/api/chat`, {
                model: process.env.ENV === "dev" ? "deepseek-r1:14b" : "deepseek-r1:1.5b",
                messages: [
                    {
                        "role": "user",
                        "content": req.body.content
                    }
                ],
            }, {
                responseType: "stream",
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            response.data.on('data', async (chunk: Buffer) => {
                try {
                    const contentData = JSON.parse((chunk.toString()! as any)).message.content;
                    console.log(contentData);
                } catch (error: any) {
                    throw new Error(error);
                }
            });

            response.data.on('end', () => {
                logger.info('Streaming completed');
                res.sendStatus(200);
            });

        } catch (error) {
            if (axios.isAxiosError(error)) {
                logger.error('Axios error occurred:', error);
            } else {
                logger.error('Unknown error:', error);
            }
            next(error);
        }
    }

    async getChatResponseAudio(req: Request, res: Response, next: NextFunction) {
        try {
            const elevenlabs = new ElevenLabsClient({
                apiKey: process.env.ELEVENLABS_API_KEY
            });

            // check the available voices
            // const voices = await elevenlabs.voices.getAll();

            const response = await axios.post(`http://${process.env.ENV === "dev" ? "localhost" : "ollama"}:11434/api/chat`, {
                model: process.env.ENV === "dev" ? "deepseek-r1:14b" : "deepseek-r1:1.5b",
                messages: [
                    {
                        "role": "system", //"system" is a prompt to define how the model should act.
                        "content": "you are the black panther" //system prompt should be written here
                    },
                    {
                        "role": "user",
                        "content": req.body.content
                    }
                ],
                stream: false,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const audio = await elevenlabs.generate({
                // voice: "George",
                voice: "Yomi - Young African Nigerian Youruba Accent",
                text: response.data.message.content,
                model_id: "eleven_multilingual_v2",
            });

            await play(audio);

            res.status(200).json(response.data);

        } catch (error) {
            if (axios.isAxiosError(error)) {
                logger.error('Axios error occurred:', error);
            } else {
                logger.error('Unknown error:', error);
            }
            next(error);
        }
    }
}