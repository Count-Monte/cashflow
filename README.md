<p align="center">
    <br>
    <img src="https://raw.githubusercontent.com/lukaschoebel/cashflow/develop/assets/cashflow_header.png" width="400"/>
    <br>
<p>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [CashFlow](#cashflow)
  - [Use Case & Motivation](#use-case--motivation)
  - [HowTo](#howto)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# CashFlow

This project originated from the seminar on *Advanced Blockchain Technologies* (IN2107) at the Technical University of Munich. Within the scope of this course, we analyzed the technical characteristics, advantages as well as limitations of Hyperledger Fabric thoroughly, and proposed a proof-of-concept for a use case.

## Use Case & Motivation

With the objective to track money in large construction projects, project `CashFlow` aims to build a redundant alternative to legal agreements on paper. By implementing a prototype based on Hyperledger Fabric, we suggest a solution that is transparent, secure and efficient.

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
# Change to javascript folder and install all necessary node modules
cd javascript && npm install
```

```bash
# Register the admin user 
node enrollAdmin.js
```

```bash
# Register client users "Authority", "Construction Company" and "Architect"
# Flags (-a, -o, -c) specify the respective role
node registerUser.js -a Authority -o Construction\ Company -c Architect
```
Try interacting with the set-up blockchain network

```bash
# Create and sign a new legal agreement as organizer with the following parameters:
# > id: "LAG4", hash: "52ABC1042", amount: "10M", partner_1: "Construction Company", partner_2: "Architect"
node query.js organizer create LAG4 52ABC1042 10M Construction\ Company Architect
```

```bash
# Sign legal agreement "LAG4" as contractor and check the respective document
node query.js contractor sign LAG4
node query.js contractor query LAG4
```
Control cash flow within the project

```bash
# Query all agreements as authority
node query.js authority queryAll
```
