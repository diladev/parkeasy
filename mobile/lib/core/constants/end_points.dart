const String kbaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://127.0.0.1:3001',
);

const kAuth = '$kbaseUrl/user/local';
const kLogin = '$kAuth/login';
const kLogout = '$kAuth/logout';
const kRefreshToken = '$kAuth/refresh';
const kRegister = '$kAuth/register';
const kForgotPassword = '$kAuth/forgot-password';
const kResetPassword = '$kAuth/reset-password';
const kVerifyOtp = '$kAuth/verify-otp';

const kUsers = '$kbaseUrl/users';
const kProfile = '$kUsers/profile';
const kChangePassword = '$kUsers/change-password';
const kVehicles = '$kUsers/vehicles';

const kParking = '$kbaseUrl/parking';

const kWallet = '$kbaseUrl/wallet';

const kNotification = '$kbaseUrl/notification';
