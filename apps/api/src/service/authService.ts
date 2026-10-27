import argon2 from "argon2";
import  {prisma} from "../config/client";
import type { RegisterInput } from "../schema/authSchema";


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

export { registerUser };
