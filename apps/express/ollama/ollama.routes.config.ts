import { CommonRoutesConfig } from '../common/common.routes.config';
import express from 'express';
import axios from "axios";

export class OllamaRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'OllamaRoutes');
    }

    configureRoutes() {
        this.app.route(`/ollama`)
            .get(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
                try {
                    const response = await axios.post(`http://ollama:11434/api/chat`, {
                        model: "deepseek-r1:1.5b",
                        messages: [
                            {
                                "role": "user", //"user" is a prompt provided by the user.
                                "content": req.body.content //user prompt should be written here
                            }
                        ],
                    }, {
                        responseType: "stream",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    response.data.on('data', (chunk: Buffer) => {
                        console.log(`${JSON.parse((chunk.toString()! as any)).message.content}`);
                    });

                    response.data.on('end', () => {
                        console.log('Streaming completed');
                        res.sendStatus(200);
                    });

                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        // `error` is now typed as `AxiosError`
                        console.error('Axios error occurred:', error);
                    } else {
                        // Handle non-Axios errors
                        console.error('Unknown error:', error);
                    }
                }
            })
        // .post(
        //     UsersMiddleware.validateRequiredUserBodyFields,
        //     UsersMiddleware.validateSameEmailDoesntExist,
        //     UsersController.createUser);
        return this.app;
    }
}