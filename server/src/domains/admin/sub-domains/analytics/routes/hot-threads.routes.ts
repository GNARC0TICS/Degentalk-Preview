import { Router } from 'express';

const router = Router();

router.get('/hot-threads', (req, res) => {
  res.json([
    {
      threadId: 'example-thread-id-1',
      slug: 'this-is-a-popular-thread',
      title: 'This is a popular thread',
      replies: 12,
      views: 1200,
      clout: 38,
      forum: {
        slug: 'general',
        name: 'General Discussion',
        forum_type: 'general',
      }
    },
    {
      threadId: 'example-thread-id-2',
      slug: 'another-hot-topic',
      title: 'Another Hot Topic!',
      replies: 42,
      views: 2500,
      clout: 99,
      forum: {
        slug: 'the-pit',
        name: 'The Pit',
        forum_type: 'primary',
      }
    },
    {
      threadId: 'example-thread-id-3',
      slug: 'mission-control-bounty',
      title: 'URGENT: Bounty for new UI component',
      replies: 5,
      views: 800,
      clout: 150,
      forum: {
        slug: 'mission-control',
        name: 'Mission Control',
        forum_type: 'primary',
      }
    }
  ]);
});

export default router;
