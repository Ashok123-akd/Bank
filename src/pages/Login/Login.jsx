import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../Signup/Signup.css';
import BrandLogo from '../../components/BrandLogo';
import { Card, Input, Typography, Form, Button, message } from 'antd'
import { useForm, Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../provider/AuthContextProvider';

const { Title } = Typography;
const loginSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),

  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),

});

function Login() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginError, setLoginError] = useState('');

  const onSubmit = async (data) => {
    try {
      setLoginError('');
      await login(data.email, data.password);
      message.success('Login successful!');
      navigate('/app'); // Redirect to app dashboard
    } catch (error) {
      setLoginError(error.message);
      message.error(error.message);
    }
  };
  return (
    <div className="container">
      <Card className="card">
        <div className="brand-wrap">
          <BrandLogo size={76} />
        </div>
        <Title level={3} style={{ textAlign: 'center' }}>
          Login
        </Title>

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label="Email"
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter your email" />
              )}
            />
          </Form.Item>
          <Form.Item
            label="Password"
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password {...field} placeholder="Password" />
              )}
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={isSubmitting}
          >
            Login
          </Button>



        </Form>
        <p>If you don't have an account <Link to="/signup">Click here</Link></p>
      </Card>
    </div>
  )
}

export default Login;
