import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

type CenteredResultProps = {
  status: '403' | '404';
  title: string;
  subtitle: string;
};

export function CenteredResult({ status, title, subtitle }: CenteredResultProps) {
  const navigate = useNavigate();

  return (
    <div className="centered-result">
      <Result
        status={status}
        title={title}
        subTitle={subtitle}
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            返回看板
          </Button>
        }
      />
    </div>
  );
}

