import { SignJWT, jwtVerify } from "jose"

const ALGO = "HS256"
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function signToken(data: { sub: string; role: string }) {
  return await new SignJWT({ role: data.role })
    .setProtectedHeader({ alg: ALGO })
    .setSubject(data.sub)
    .setExpirationTime("7d")
    .sign(SECRET)
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, SECRET)
  return { sub: payload.sub as string, role: payload.role as string }
}
