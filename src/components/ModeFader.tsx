import { type ReactNode, useEffect, useState } from 'react';

interface Props {
  modeKey: string;
  children: ReactNode;
}

export function ModeFader({ modeKey, children }: Props) {
  const [shownKey, setShownKey] = useState(modeKey);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (modeKey === shownKey) return;

    setOpacity(0);
    const t = window.setTimeout(() => {
      setShownKey(modeKey);
      setOpacity(1);
    }, 150);
    return () => window.clearTimeout(t);
  }, [modeKey, shownKey]);

  return <div style={{ transition: 'opacity 150ms', opacity }}>{children}</div>;
}
