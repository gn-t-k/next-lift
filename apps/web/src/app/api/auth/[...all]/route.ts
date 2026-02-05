import { toNextJsHandler } from "@next-lift/authentication/better-auth-nextjs";
import { auth } from "@next-lift/authentication/instance";
import { createLazyProxy } from "@next-lift/utilities/create-lazy-proxy";

// モジュールロード時にauth.handlerへアクセスすると、Next.jsビルド中に環境変数が必要になる
// リクエスト時まで初期化を遅延することで、ビルド時の環境変数を不要にする
const handlers = createLazyProxy(() => toNextJsHandler(auth.handler));

export const GET = (request: Request) => handlers.GET(request);
export const POST = (request: Request) => handlers.POST(request);
