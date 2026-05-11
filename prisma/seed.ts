import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.HOST_USERNAME ?? "demo";
  const name = process.env.HOST_NAME ?? "Demo Host";
  const timezone = process.env.HOST_TIMEZONE ?? "Asia/Kolkata";

  const host = await prisma.host.upsert({
    where: { username },
    update: { name, timezone },
    create: {
      username,
      name,
      timezone,
      bio: "Book a time with me. All times shown in your local timezone.",
    },
  });

  const eventTypes = [
    {
      slug: "intro-call",
      title: "Intro call",
      description: "A quick introduction. Tell me what you're working on.",
      durationMin: 15,
    },
    {
      slug: "consultation",
      title: "30-min consultation",
      description: "Deeper dive into your problem. Bring questions.",
      durationMin: 30,
    },
    {
      slug: "deep-work",
      title: "60-min working session",
      description: "We pair on the problem together for an hour.",
      durationMin: 60,
      bufferMin: 15,
    },
  ];

  for (const et of eventTypes) {
    await prisma.eventType.upsert({
      where: { hostId_slug: { hostId: host.id, slug: et.slug } },
      update: et,
      create: { ...et, hostId: host.id },
    });
  }

  await prisma.availabilityRule.deleteMany({ where: { hostId: host.id } });
  for (let day = 1; day <= 5; day++) {
    await prisma.availabilityRule.create({
      data: { hostId: host.id, dayOfWeek: day, startMin: 9 * 60, endMin: 17 * 60 },
    });
  }

  console.log(`Seeded host '${username}' with ${eventTypes.length} event types.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
