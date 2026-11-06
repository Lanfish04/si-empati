import { prisma } from "../config/client.js";
import { ScenarioInput } from "../schemas/scenarioSchema.js";


async function createScenario(input: ScenarioInput, createdById: string) {

    const existingScenario = await prisma.scenario.findFirst({
        where: {
            title: input.title,
            slug : input.slug,
            createdById: createdById,
        }
    });
    
    if (existingScenario) {
        return null;
    }

    const scenario = await prisma.scenario.create({
        data: {
            title: input.title,
            description: input.description,
            category: input.category,
            slug: input.slug,
            createdById: createdById,
        },
        select :{
            id: true,
            title: true,
            description: true,
            slug: true,
            category: true,
            createdById: true,
            status: true,
            createdAt: true,
            publishedAt: true,

        }

});

    return scenario;

}


export { createScenario };