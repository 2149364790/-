import { SimulationStep } from './types';

export const LOGIN_STEPS: SimulationStep[] = [
  {
    id: 0,
    title: "用户提交表单 (Vue 3)",
    description: "用户输入用户名和密码，点击登录。Vue 组件通过 Axios 发起 POST 请求。",
    source: "CLIENT",
    target: "SERVER",
    codeLang: "javascript",
    codeContent: `// Login.vue
const handleLogin = async () => {
  const res = await axios.post('/api/login', {
    username: 'admin',
    password: 'password123'
  });
  localStorage.setItem('token', res.data.token);
};`,
    payloadType: "Request",
    payloadContent: `{
  "username": "admin",
  "password": "***"
}`,
    activeComponent: "axios"
  },
  {
    id: 1,
    title: "后端接收请求 (Controller)",
    description: "Spring Boot Controller 接收请求体，调用 Service 层处理业务逻辑。",
    source: "SERVER",
    target: "SERVER",
    codeLang: "java",
    codeContent: `// AuthController.java
@PostMapping("/login")
public Result login(@RequestBody LoginDto dto) {
    // 调用服务层
    User user = userService.login(dto);
    // ...
}`,
    payloadType: "Internal",
    payloadContent: "LoginDto(username=admin, ...)",
    activeComponent: "controller"
  },
  {
    id: 2,
    title: "MyBatis-Plus 查询数据库",
    description: "Service 层调用 Mapper 接口。MyBatis-Plus 自动生成 SQL 查询语句。",
    source: "SERVER",
    target: "DATABASE",
    codeLang: "java",
    codeContent: `// UserService.java
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getUsername, dto.getUsername());
User user = userMapper.selectOne(wrapper);`,
    payloadType: "Query",
    payloadContent: "SELECT id, username, password, role FROM sys_user WHERE username = 'admin'",
    activeComponent: "mapper"
  },
  {
    id: 3,
    title: "数据库返回结果",
    description: "MySQL 执行查询，找到匹配的用户记录并返回。",
    source: "DATABASE",
    target: "SERVER",
    codeLang: "sql",
    codeContent: `-- MySQL Output
1 row returned
Execution time: 2ms`,
    payloadType: "Response",
    payloadContent: `{
  "id": 101,
  "username": "admin",
  "role": "admin",
  "password_hash": "$2a$10$..."
}`,
    activeComponent: "database"
  },
  {
    id: 4,
    title: "生成 JWT 令牌",
    description: "验证密码通过后，Spring Boot 使用工具类生成 JWT Token (包含用户信息和过期时间)。",
    source: "SERVER",
    target: "SERVER",
    codeLang: "java",
    codeContent: `// JwtUtils.java
String token = Jwts.builder()
    .setSubject(user.getUsername())
    .claim("role", user.getRole())
    .setExpiration(new Date(System.currentTimeMillis() + 3600000))
    .signWith(SignatureAlgorithm.HS256, secret)
    .compact();`,
    payloadType: "Internal",
    payloadContent: "Token Generated: eyJhbGciOiJIUzI1NiIsInR...",
    activeComponent: "jwt"
  },
  {
    id: 5,
    title: "返回响应给前端",
    description: "后端将 Token 封装在标准统一响应对象中返回给前端。",
    source: "SERVER",
    target: "CLIENT",
    codeLang: "json",
    codeContent: `// HTTP Response 200 OK
{
  "code": 200,
  "msg": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni..."
  }
}`,
    payloadType: "Response",
    payloadContent: "{ code: 200, token: '...' }",
    activeComponent: "response"
  },
  {
    id: 6,
    title: "前端存储 Token",
    description: "Vue 获取到 Token，将其存入 LocalStorage 或 Pinia 中，用于后续请求。",
    source: "CLIENT",
    target: "CLIENT",
    codeLang: "javascript",
    codeContent: `// Axios Response Interceptor or Component
localStorage.setItem('access_token', token);
router.push('/dashboard');`,
    payloadType: "Internal",
    payloadContent: "LocalStorage Updated",
    activeComponent: "storage"
  }
];

export const FETCH_STEPS: SimulationStep[] = [
  {
    id: 0,
    title: "发起数据请求 (Axios Interceptor)",
    description: "前端请求用户列表。Axios 请求拦截器自动将 Token 添加到请求头。",
    source: "CLIENT",
    target: "SERVER",
    codeLang: "javascript",
    codeContent: `// request.js (Axios Interceptor)
service.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  return config;
})`,
    payloadType: "Request",
    payloadContent: `GET /api/users/list
Headers: {
  Authorization: "Bearer eyJhb..."
}`,
    activeComponent: "axios"
  },
  {
    id: 1,
    title: "Token 校验 (Interceptor/Filter)",
    description: "Spring Boot 拦截器/过滤器捕获请求，解析 Token 验证合法性。",
    source: "SERVER",
    target: "SERVER",
    codeLang: "java",
    codeContent: `// AuthInterceptor.java
String token = request.getHeader("Authorization");
if (JwtUtils.validate(token)) {
    UserContext.set(JwtUtils.getUser(token)); // 存入上下文
    return true; 
} else {
    throw new UnauthorizedException();
}`,
    payloadType: "Internal",
    payloadContent: "Token Valid: true\nUser: admin",
    activeComponent: "filter"
  },
  {
    id: 2,
    title: "Controller & MyBatis-Plus 分页查询",
    description: "Controller 接收请求，调用 Service 使用 MyBatis-Plus 进行分页查询。",
    source: "SERVER",
    target: "DATABASE",
    codeLang: "java",
    codeContent: `// UserController.java
Page<User> page = new Page<>(1, 10);
IPage<User> userPage = userMapper.selectPage(page, null);
return Result.success(userPage);`,
    payloadType: "Query",
    payloadContent: "SELECT id, username, email FROM sys_user LIMIT 0, 10",
    activeComponent: "mapper"
  },
  {
    id: 3,
    title: "数据库返回数据",
    description: "MySQL 返回符合条件的数据集。",
    source: "DATABASE",
    target: "SERVER",
    codeLang: "sql",
    codeContent: `-- MySQL Result
10 rows returned`,
    payloadType: "Response",
    payloadContent: "[{id:1, name:'User1'}, {id:2, name:'User2'}...]",
    activeComponent: "database"
  },
  {
    id: 4,
    title: "后端返回 JSON",
    description: "Spring Boot 将 Java 对象序列化为 JSON 格式返回给前端。",
    source: "SERVER",
    target: "CLIENT",
    codeLang: "json",
    codeContent: `{
  "code": 200,
  "data": {
    "records": [...],
    "total": 50,
    "current": 1,
    "size": 10
  }
}`,
    payloadType: "Response",
    payloadContent: "JSON Payload",
    activeComponent: "response"
  },
  {
    id: 5,
    title: "前端渲染数据",
    description: "Vue 组件接收数据并更新响应式变量，DOM 自动刷新显示列表。",
    source: "CLIENT",
    target: "CLIENT",
    codeLang: "javascript",
    codeContent: `// UserList.vue
const userList = ref([]);
const fetchUsers = async () => {
  const res = await api.getUsers();
  userList.value = res.data.records;
}`,
    payloadType: "Internal",
    payloadContent: "DOM Updated",
    activeComponent: "render"
  }
];