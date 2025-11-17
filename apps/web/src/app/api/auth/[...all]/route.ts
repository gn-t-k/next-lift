import { toNextJsHandler } from "@next-lift/authentication/better-auth-nextjs";
import { auth } from "@next-lift/authentication/instance";

// 関数化することで、auth.handlerへのアクセスをリクエスト時まで遅延
// これにより、ビルド時にはauthインスタンスが初期化されず、環境変数が不要になる
const handlers = () => toNextJsHandler(auth.handler);

export const GET = (request: Request) => handlers().GET(request);
export const POST = (request: Request) => handlers().POST(request);
