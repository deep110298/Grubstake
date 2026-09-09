import { TOTAL_LEVELS } from '@/lib/leastCount/storyLevels';
import StoryLevelBoard from '@/components/leastcount/StoryLevelBoard';

export default async function StoryLevelPage(props: PageProps<'/play/story/[id]'>) {
  const { id } = await props.params;
  const globalId = Number(id);
  const validId = Number.isInteger(globalId) && globalId >= 1 && globalId <= TOTAL_LEVELS ? globalId : 1;
  return <StoryLevelBoard globalId={validId} />;
}
