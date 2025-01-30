import express from 'express';
import { OllamaController } from './ollama.controller';
import { CommonRoutesConfig } from '../common/common.routes.config';
import { ElevenLabsClient, play } from "elevenlabs";

export class OllamaRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'OllamaRoutes');
    }

    configureRoutes() {
        const ollamaController = new OllamaController();

        this.app.route(`/ollama`)
            .get(ollamaController.getChatResponse);

        return this.app;
    }
}