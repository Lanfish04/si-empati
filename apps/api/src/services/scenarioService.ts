import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../config/client.js";
import { ScenarioInput } from "../schemas/scenarioSchema.js";

export class ScenarioNotFoundError extends Error {
  constructor() {
    super("Scenario tidak ditemukan.");
    this.name = "ScenarioNotFoundError";
  }
}

export class ScenarioNotDraftError extends Error {
  constructor(action: "diperbarui" | "dihapus") {
    super(`Scenario hanya dapat ${action} ketika berstatus DRAFT.`);
    this.name = "ScenarioNotDraftError";
  }
}

type ScenarioStatusFilter = "DRAFT" | "PUBLISHED" | "ARCHIVED";

interface GetAllScenariosParams {
  page?: number;
  limit?: number;
  status?: ScenarioStatusFilter;
  category?: string;
  search?: string;
}

async function getAllScenarios({
  page = 1,
  limit = 10,
  status,
  category,
  search,
}: GetAllScenariosParams = {}) {
  // Menghitung posisi awal data
  const skip = (page - 1) * limit;

  // Menyiapkan filter database
  const where: Prisma.ScenarioWhereInput = {};


  if (status) {
    where.status = status;
  }

  if (category) {
    where.category = {
      equals: category,
      mode: "insensitive",
    };
  }

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        slug: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  // Mengambil data dan total data secara bersamaan
  const [scenarios, total] = await prisma.$transaction([
    prisma.scenario.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        category: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,

        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },

        _count: {
          select: {
            steps: true,
          },
        },
      },
    }),

    prisma.scenario.count({
      where,
    }),
  ]);

  return {
    data: scenarios,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}



async function getScenarioById(scenarioId: string) {
    const scenario = await prisma.scenario.findUnique({
        where: {
            id: scenarioId,
        },
        select: {
            id: true,
            title: true,
            description: true,
            slug: true,
            category: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            publishedAt: true,
            
            createdBy: {
        select: {
          id: true,
          name: true,
        },
      },

      steps: {
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          order: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,

          responses: {
            orderBy: {
              order: "asc",
            },
            select: {
              id: true,
              order: true,
              text: true,
              consequenceText: true,
              learningFeedback: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });

  if (!scenario) {
    throw new ScenarioNotFoundError();
  }

  return scenario;
}
 

async function createScenario(input: ScenarioInput, createdById: string) {
    const existingScenario = await prisma.scenario.findFirst({
        where: {
            title: input.title,
            createdById: createdById,
        }
    });
    if (existingScenario) {
        throw new ScenarioNotFoundError();
    }

    const scenario = await prisma.scenario.create({
        data: {
            title: input.title,
            description: input.description,
            category: input.category,
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


async function updateScenario(scenarioId: string, input: ScenarioInput) {
    const scenario = await prisma.scenario.updateMany({
        where: {
            id: scenarioId,
            status : "DRAFT"
        },
        data: input,
    });


    if (scenario.count === 0) {
    const existingScenario = await prisma.scenario.findUnique({
      where: {
        id: scenarioId,
      },
      select: {
        id: true,
      },
    });

    if (!existingScenario) {
      throw new ScenarioNotFoundError();
    }

    throw new ScenarioNotDraftError("diperbarui");
  }

    return scenario;
}


async function deleteScenario(scenarioId: string) {
  const result = await prisma.scenario.deleteMany({
    where: {
      id: scenarioId,
      status: "DRAFT",
    },
  });

  if (result.count === 0) {
    const existingScenario = await prisma.scenario.findUnique({
      where: {
        id: scenarioId,
      },
      select: {
        id: true,
      },
    });

    if (!existingScenario) {
      throw new ScenarioNotFoundError();
    }

    throw new ScenarioNotDraftError("dihapus");
  }

  return {
    id: scenarioId,
  };
}

  


export { getAllScenarios, getScenarioById, createScenario, updateScenario, deleteScenario };