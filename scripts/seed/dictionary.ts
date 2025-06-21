import { db } from '@db';
import { dictionaryEntries } from '@schema';
import { slugify } from '@server/src/utils/slugify';

(async () => {
    const seedData = [
        {
            word: 'Copeflation',
            definition: 'The inevitable increase in your coping mechanisms as the market dumps.',
            usageExample: 'After missing the pump, he blamed "copeflation" for his paper hands.',
            tags: ['cope', 'inflation', 'markets']
        },
        {
            word: 'Shadowpump',
            definition: 'A mysterious price surge that happens only when you sleep.',
            usageExample: 'BTC did a shadowpump at 3 AM again, I woke up broke.',
            tags: ['pump', 'btc', 'night']
        },
        {
            word: 'Bagstitution',
            definition: 'The act of swapping one doomed bag of tokens for another in hopes of salvation.',
            usageExample: 'He performed a bagstitution, trading LUNA for FTT… bold move.',
            tags: ['bags', 'trading', 'copium']
        }
    ];

    for (const entry of seedData) {
        const slug = slugify(entry.word);
        await db
            .insert(dictionaryEntries)
            .values({
                ...entry,
                slug,
                authorId: '00000000-0000-0000-0000-000000000001', // system user
                status: 'approved'
            })
            .onConflictDoNothing();
    }

    console.log('✅ Dictionary seeds inserted');
    process.exit(0);
})(); 