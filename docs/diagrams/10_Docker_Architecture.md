# Docker Architecture

```text
+------------------------------------------------------+
|                 Docker Host                          |
|                                                      |
|  +------------+  +------------+  +---------------+   |
|  | React      |  | Nginx      |  | Spring Boot   |   |
|  | Container  |->| Container  |->| Container     |   |
|  +------------+  +------------+  +-------+-------+   |
|                                             |         |
|                                             |         |
|                                    +--------v------+  |
|                                    | FastAPI AI    |  |
|                                    | Container     |  |
|                                    +----+-----+----+  |
|                                         |     |       |
|                                +--------+     +-----+ |
|                                |                    | |
|                         +------+-----+      +-------+-+
|                         | MongoDB    |      | Qdrant |
|                         | Container  |      |Container|
|                         +------------+      +---------+
+------------------------------------------------------+
```

## Description

Each major service runs inside its own Docker container, enabling isolation, portability, and simplified deployment.