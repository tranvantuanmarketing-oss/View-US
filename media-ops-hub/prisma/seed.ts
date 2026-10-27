import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Đang bắt đầu seed dữ liệu ban đầu cho media-ops-hub ---');

  // 1. Seed 4 Fanpage chính thức
  const fanpages = [
    {
      name: 'Masques Tombés',
      code: 'fr_masques',
      country: 'FR',
      timezone: 'Europe/Paris',
      viaName: 'Via FR 01',
      fbPageId: '100091234567890',
      status: 'ACTIVE',
    },
    {
      name: 'Dernières Volontés',
      code: 'fr_dernieres',
      country: 'FR',
      timezone: 'Europe/Paris',
      viaName: 'Via FR 02',
      fbPageId: '100091234567891',
      status: 'ACTIVE',
    },
    {
      name: 'Verborgen Waarheden',
      code: 'nl_verborgen',
      country: 'NL',
      timezone: 'Europe/Amsterdam',
      viaName: 'Via NL 01',
      fbPageId: '100091234567892',
      status: 'ACTIVE',
    },
    {
      name: 'Achter de Façade',
      code: 'nl_achter',
      country: 'NL',
      timezone: 'Europe/Amsterdam',
      viaName: 'Via NL 02',
      fbPageId: '100091234567893',
      status: 'ACTIVE',
    },
  ];

  for (const page of fanpages) {
    await prisma.fanpage.upsert({
      where: { code: page.code },
      update: page,
      create: page,
    });
  }
  console.log('✓ Đã tạo thành công 4 Fanpage (2 Pháp 🇫🇷, 2 Hà Lan 🇳🇱)');

  // 2. Seed kho link bài viết Blog kéo view thestorypress.online
  const blogArticles = [
    {
      title: "L'héritage secret de la famille Beaumont",
      url: 'https://thestorypress.online/fr/heritage-secret-beaumont',
      lang: 'fr',
      category: 'Mystery / Drama',
      clickCount: 124,
    },
    {
      title: "Les confessions nocturnes d'Adèle",
      url: 'https://thestorypress.online/fr/confessions-nocturnes-adele',
      lang: 'fr',
      category: 'Romance / Drama',
      clickCount: 89,
    },
    {
      title: 'Het verborgen testament van Amsterdam',
      url: 'https://thestorypress.online/nl/verborgen-testament-amsterdam',
      lang: 'nl',
      category: 'Thriller / Mystery',
      clickCount: 205,
    },
    {
      title: 'Dubbelleven achter de grachtenpanden',
      url: 'https://thestorypress.online/nl/dubbelleven-achter-de-grachtenpanden',
      lang: 'nl',
      category: 'Drama',
      clickCount: 154,
    },
  ];

  for (const article of blogArticles) {
    await prisma.blogArticle.upsert({
      where: { url: article.url },
      update: article,
      create: article,
    });
  }
  console.log('✓ Đã tạo mẫu các link blog thestorypress.online');

  // 3. Seed vài bài viết mẫu ở các trạng thái khác nhau
  const frPage = await prisma.fanpage.findUnique({ where: { code: 'fr_masques' } });
  const nlPage = await prisma.fanpage.findUnique({ where: { code: 'nl_verborgen' } });

  if (frPage) {
    // 1 bài đang SCHEDULED (chuẩn bị đến giờ để test queue)
    await prisma.post.create({
      data: {
        fanpageId: frPage.id,
        title: 'Masques Tombés - Tập 1: Bức thư tuyệt mệnh',
        videoPath: '/Users/tony/Downloads/View US/videos/masques_ep1.mp4',
        caption: 'Le secret enfin dévoilé sous les ombres du passé... 💔🇫🇷 #drama #reels #suspense',
        commentLink: 'https://thestorypress.online/fr/heritage-secret-beaumont',
        scheduledAt: new Date(Date.now() - 5 * 60 * 1000), // 5 phút trước -> Đã đến giờ đăng
        status: 'SCHEDULED',
      },
    });

    // 1 bài đã PUBLISHED
    await prisma.post.create({
      data: {
        fanpageId: frPage.id,
        title: 'Masques Tombés - Teaser Bí Mật',
        videoPath: '/Users/tony/Downloads/View US/videos/masques_teaser.mp4',
        caption: 'Qui ment vraiment dans ce manoir ? #reels #france',
        commentLink: 'https://thestorypress.online/fr/confessions-nocturnes-adele',
        scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        publishedAt: new Date(Date.now() - 110 * 60 * 1000),
        fbPostUrl: 'https://www.facebook.com/reel/987654321012345',
        status: 'PUBLISHED',
      },
    });
  }

  if (nlPage) {
    // 1 bài READY
    await prisma.post.create({
      data: {
        fanpageId: nlPage.id,
        title: 'Verborgen Waarheden - Aflevering 1: De Confrontatie',
        videoPath: '/Users/tony/Downloads/View US/videos/verborgen_ep1.mp4',
        caption: 'Wat er die nacht echt gebeurde... Kijk tot het einde! 🇳🇱🔥 #spanning #nederland',
        commentLink: 'https://thestorypress.online/nl/verborgen-testament-amsterdam',
        scheduledAt: new Date(Date.now() + 60 * 60 * 1000), // 1 giờ sau
        status: 'READY',
      },
    });
  }

  // 4. Seed system log
  await prisma.systemLog.create({
    data: {
      level: 'INFO',
      module: 'SEED',
      message: 'Khởi tạo hệ thống Media Ops Hub thành công với 4 Fanpage.',
    },
  });

  console.log('--- Seed dữ liệu hoàn tất! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
