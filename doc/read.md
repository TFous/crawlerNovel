管理员启动，path 环境变量  C:\Program Files\MongoDB\Server\3.6\bin\
mongod  --dbpath F:\mongdb\db
mongod --dbpath "F:\mongdb\db" --logpath "F:\mongdb\logs\mongodb.log" --serviceName "mongodb" --serviceDisplayName "mongodb" --install
net start mongodb


删除注册表：HKEY_CURRENT_USER\Software\NoSQL Manager Group
备份appConfig.xml文件（里面有你的数据库配置信息，包括帐号密码）
删除应用数据：C:\ProgramData\NoSQL Manager Group