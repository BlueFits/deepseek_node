import express from 'express';
import bodyparser from 'body-parser';
import cors from 'cors';
import winston from 'winston';
import expressWinston from 'express-winston';
import debug from 'debug';
import { CommonRoutesConfig } from './common/common.routes.config';
import { UsersRoutes } from './users/users.routes.config';
import { OllamaRoutes } from './ollama/ollama.routes.config';
import dotenv from 'dotenv';

dotenv.config();

const app: express.Application = express();
const server: any = require('http').Server(app);
const port: number = parseInt(process.env.PORT as string, 10) || 3000;
const routes: Array<CommonRoutesConfig> = [];
const debugLog: debug.IDebugger = debug('app');

// Middleware setup
app.use(bodyparser.json());
app.use(cors());

// Logger setup
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    )
}));

// Route configuration
routes.push(new UsersRoutes(app));
routes.push(new OllamaRoutes(app));

// Error logger setup
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    )
}));

// Root route
app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send(`Server running at http://localhost:${port}`);
});

// Start server
server.listen(port, () => {
    debugLog(`Server running at http://localhost:${port}`);
    routes.forEach((route: CommonRoutesConfig) => {
        debugLog(`Routes configured for ${route.getName()}`);
    });
});