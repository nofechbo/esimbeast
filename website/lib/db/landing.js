import { prisma } from "./prisma";

export async function getLandingPageBySlug(slug) {
  return prisma.landingPage.findFirst({ where: { slug, published: true } });
}

export async function getAllLandingPages() {
  return prisma.landingPage.findMany({ where: { published: true } });
}

export async function getLandingPagesByDestination(destination) {
  return prisma.landingPage.findMany({
    where: { destination, published: true },
    orderBy: { modifier: "asc" },
  });
}
