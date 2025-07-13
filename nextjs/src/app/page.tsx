import { Button, Input, Loading } from '@/components/ui';

export default function Home() {
  return (
    <div className="container mx-auto">
      <Button variant="primary">Default</Button>
      <Input label="기본 입력 필드" placeholder="텍스트 입력" />
      <Loading size="sm" text="작게" />
    </div>
  );
}
