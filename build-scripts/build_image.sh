faas-cli build -f server_side_renderer.yml && faas-cli deploy -f ./server_side_renderer.yml && watch docker service ls