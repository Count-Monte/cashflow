<p align="center">
    <br>
    <img src="https://raw.githubusercontent.com/lukaschoebel/cashflow/develop/assets/cashflow_header.png" width="400"/>
    <br>
<p>

# CashFlow

This project originated from the seminar on *Advanced Blockchain Technologies* (IN2107) at the Technical University of Munich. Within the scope of this course, we analyzed the technical characteristics, advantages as well as limitations of Hyperledger Fabric thoroughly and propose a proof-of-concept for a use case.

## Use Case & Motivation 

With the objective to track money in large building projects, project `CashFlow` aims to build a redundant alternative to legal agreements on paper. By implementing a prototype based on Hyperledger Fabric, we suggest a solution that is transparent, secure and efficient.

## HowTo

If the network has already been setup, it first has to be stopped and the created docker images and containers have to be removed:

```bash
cd first-network

# Take the network down
./byfn.sh down

# Deletes all the dangling images
docker image prune –a

# Remove all the containers that are stopped in the application
docker container prune
```

After everything is cleaned, proceed by changing the directory and executing the start script which will build the network and boot all necessary docker containers:

```bash
# Change to directory and start Fabric network
cd ../cashflow && ./startFabric.sh
```

```bash
# Change to javascript and install all necessary node modules
cd javascript && npm install
```

```bash
node enrollAdmin.js
```

```bash
# Register multiple users "Authority", "Construction Company" and "Architect"
# Flags (-a, -o, -c) specify the respective role
node registerUser.js -a Authority -o Construction\ Company -c Architect
```

```bash
# Create and sign a new legal agreement as organizer with the following parameters:
# > id: "LAG4", hash: "42ABC1042", amount: "10M", partner_1: "Construction Company", partner_2: "Architect"
node query.js organizer create LAG42 42ABC1042 10M Construction\ Company Architect
```

```bash
# Sign legal agreement "LAG42" as contractor and find the respective document
node query.js contractor sign LAG42
node query.js contractor query LAG42
```

```bash
# Query all agreements as authority
node query.js authority queryAll
```