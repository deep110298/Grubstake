import RoomView from '@/components/leastcount/friends/RoomView';

export default async function RoomPage(props: PageProps<'/room/[code]'>) {
  const { code } = await props.params;
  return <RoomView code={code} />;
}
