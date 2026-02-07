import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet());

    this.app.use(
      cors({
        origin: config.cors.origin,
        credentials: true,
      })
    );

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard',
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.app.use('/api/', limiter);

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    if (config.nodeEnv === 'development') {
      this.app.use((req, _res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
      });
    }
  }

  private initializeRoutes(): void {
    this.app.use('/api', routes);

    this.app.get('/', (_req, res) => {
      res.json({
        message: 'Pokémon Battle API',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          auth: '/api/auth',
        },
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);

    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(config.port, () => {
      console.log(`
╔════════════════════════════════════════════╗
║   🎮 Pokémon Battle API                    ║
║   🚀 Server running on port ${config.port}           ║
║   📦 Environment: ${config.nodeEnv.padEnd(18)}       ║
║   🔗 http://localhost:${config.port}                 ║
╚════════════════════════════════════════════╝
      `);
    });
  }
}

export default App;
