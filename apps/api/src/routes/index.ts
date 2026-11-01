import express, {type Router,} from 'express';
import authRouter from './auth';


const router:Router = express.Router();

interface RouteConfig {
  path: string;
  router: Router;
}

const defaultRoute: RouteConfig[] = [
{
    path:"/auth",
    router:authRouter, 

}
];

defaultRoute.forEach((route) => {
    router.use(route.path, route.router);
});


export default router;