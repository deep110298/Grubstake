import { redirect } from 'next/navigation';
import StoryLevelMap from '@/components/leastcount/StoryLevelMap';
import { WORLD_COUNT } from '@/lib/leastCount/storyLevels';

export default async function StoryWorldPage(props: PageProps<'/play/story/world/[world]'>) {
  const { world } = await props.params;
  const worldNum = Number(world);
  if (!Number.isInteger(worldNum) || worldNum < 1 || worldNum > WORLD_COUNT) {
    redirect('/play/story');
  }
  return <StoryLevelMap world={worldNum} />;
}
