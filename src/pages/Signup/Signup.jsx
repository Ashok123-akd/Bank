import { Link, useNavigate } from "react-router-dom";
import { Card, Input, Typography, Form, Button, message } from 'antd';
import { useAuth } from '../../provider/authContext';
import { useForm, Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import './Signup.css';
import BrandLogo from '../../components/BrandLogo';

const { Title } = Typography;

const signupSchema = Yup.object({
  firstName: Yup.string()
    .min(3, 'First name must be at least 3 characters')
    .required('First name is required'),

  lastName: Yup.string()
    .min(3, 'Last name must be at least 3 characters')
    .required('Last name is required'),

  address: Yup.string()
    .notRequired()
    .test(
      'min-if-filled',
      'Address must be at least 3 characters',
      (value) => !value || value.length >= 3
    ),

  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),

  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Confirm password is required'),
});

const generateAccountNumber = () =>
  `AC${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900 + 100)}`;

const generateUserId = () => Date.now();

const generateCreatedAt = () => new Date().toISOString();

function Signup() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      address: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      // Generate a simple unique account number: AC + timestamp + random 3 digits
      const accountNumber = generateAccountNumber();

      const user = {
        id: generateUserId(),
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        email: data.email,
        password: data.password,
        accountNumber,
        createdAt: generateCreatedAt(),
      };

      // Save to localStorage (demo persistence)
      const raw = localStorage.getItem('registered_users');
      const list = raw ? JSON.parse(raw) : [];
      // prevent duplicate email
      const exists = list.find(u => u.email === user.email);
      if (exists) {
        message.error('An account with this email already exists. Please login.');
        return;
      }
      list.push(user);
      localStorage.setItem('registered_users', JSON.stringify(list));

      message.success(`Account created. Your account number: ${accountNumber}`);
      // auto-login the new user
      try {
        await login(user.email, user.password);
        navigate('/app');
      } catch {
        // if auto-login fails, go to login page
        navigate('/login');
      }
    } catch (err) {
      console.error('signup error', err);
      message.error('Failed to create account.');
    }
  };

  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <div className="container">
      <Card className="card">
        <div className="brand-wrap">
          <BrandLogo size={76} />
        </div>
        <Title level={3} style={{ textAlign: 'center' }}>
          Signup
        </Title>

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {/* First Name */}
          <Form.Item
            label="First Name"
            validateStatus={errors.firstName ? 'error' : ''}
            help={errors.firstName?.message}
          >
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter your first name" />
              )}
            />
          </Form.Item>

          {/* Last Name */}
          <Form.Item
            label="Last Name"
            validateStatus={errors.lastName ? 'error' : ''}
            help={errors.lastName?.message}
          >
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter your last name" />
              )}
            />
          </Form.Item>

          {/* Address */}
          <Form.Item
            label="Address"
            validateStatus={errors.address ? 'error' : ''}
            help={errors.address?.message}
          >
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter your address" />
              )}
            />
          </Form.Item>

          {/* Email */}
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

          {/* Password */}
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

          {/* Confirm Password */}
          <Form.Item
            label="Confirm Password"
            validateStatus={errors.confirmPassword ? 'error' : ''}
            help={errors.confirmPassword?.message}
          >
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  placeholder="Confirm password"
                />
              )}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={isSubmitting}
          >
            Create Account
          </Button>
        </Form>
        <p>If you have account already {} <Link to= "/login">Click here</Link></p>
      </Card>
      
    </div>
  );
}

export default Signup;
