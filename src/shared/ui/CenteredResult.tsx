import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/store/AuthProvider';
import { getDefaultRoute } from '../constants/routes';

type CenteredResultProps = {
  status: '403' | '404';
  title: string;
  subtitle: string;
};

export function CenteredResult({ status, title, subtitle }: CenteredResultProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="centered-result">
      <Result
        status={status}
        title={title}
        subTitle={subtitle}
        extra={
          <Button type="primary" onClick={() => navigate(getDefaultRoute(currentUser?.permissions))}>
            返回首页
          </Button>
        }
      />
    </div>
  );
}
