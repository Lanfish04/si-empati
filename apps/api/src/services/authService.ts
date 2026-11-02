import argon2 from "argon2";
import  {prisma} from "../config/client";
import type { RegisterInput, LoginInput } from "../schemas/authSchema";


async function registerUser(input: RegisterInput) {
    const passwordHash = await argon2.hash(input.password, {type: argon2.argon2id});

    const user = await prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            passwordHash: passwordHash,
        },
        select:{
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        }
    });
    return user;
}

async function loginUser(input : LoginInput) {
    const user = await prisma.user.findUnique({
        where: {
            email: input.email
        }
    });

    if (!user) {
        return null;
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, input.password);

    if (!isPasswordValid) {
        return null;
    }

    return {
         id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    }
}

export { registerUser, loginUser };
