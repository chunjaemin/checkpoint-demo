import { Redirect } from 'expo-router';

export default function AppSettingsRoute() {
  // typedRoutes가 새 라우트(/settings)를 즉시 반영하지 못하는 경우가 있어 캐스팅합니다.
  return <Redirect href={'/settings' as any} />;
}

