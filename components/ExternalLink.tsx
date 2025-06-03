import { openBrowserAsync } from 'expo-web-browser';
import { Platform, Pressable, Text } from 'react-native';

interface Props {
  href: string;
  children: React.ReactNode;
  style?: any;
}

export function ExternalLink({ href, children, style }: Props) {
  return (
    <Pressable
      onPress={async () => {
        await openBrowserAsync(href);
      }}
      style={style}
    >
      <Text style={{ color: 'blue' }}>{children}</Text>
    </Pressable>
  );
}
