# OpenFaas function for Server Side Rendering

## What?

## Why?

## How?

-   Create a `minio.config.json` file in following format to run the code during development.

```
{
     "endPoint": "xxx.xxx.xxx.xxx",
     "port": 9000,
     "useSSL": false,
     "accessKey": "##########",
     "secretKey": "##########"
}
```

-   To run the function as `OpenFaas` function in production, create a docker secret like so,
    `docker secret create my_secret ./secret.json`

*   Make the secret available to `OpenFaas` function by adding it in `.yml` file,

```
   secrets:
      - my_secret
```
