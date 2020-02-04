<p align="center">
    <br>
    <img src="https://raw.githubusercontent.com/lukaschoebel/cashflow/develop/assets/cashflow_header.png" width="400"/>
    <br>
<p>

# CashFlow

This project originated from the seminar on [*Advanced Blockchain Technologies*](https://www.in.tum.de/i13/teaching/winter-semester-201920/advanced-seminar-blockchain-technologies/) (IN2107) at the Technical University of Munich. Within the scope of this course, we analyzed the technical characteristics, advantages as well as limitations of Hyperledger Fabric thoroughly, and proposed a proof-of-concept for a given use case.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Use Case & Motivation](#use-case--motivation)
- [Getting Started](#getting-started)
  - [Setting Up Hyperledger Fabric](#setting-up-hyperledger-fabric)
  - [Setting Up the Blockchain Application](#setting-up-the-blockchain-application)
  - [Docker Troubleshooting](#docker-troubleshooting)
- [Authors](#authors)
- [License](#license)
- [Acknowledgments](#acknowledgments)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Use Case & Motivation

With the objective to track money in large construction projects, project `CashFlow` aims to build a redundant alternative to legal agreements on paper. By implementing a prototype based on Hyperledger Fabric, we suggest a solution that is transparent, secure and efficient.

## Getting Started

### Setting Up Hyperledger Fabric

To get started with Hyperledger Fabric, you have to follow the subsequent five steps.

1. Install the latest version of [Docker](https://www.docker.com/get-started) and [Go](https://golang.org/dl/)

2. Add the Go environment variable `export GOPATH=$HOME/go` and `export PATH=$PATH:$GOPATH/bin` to your startup file (e.g. `~/.bashrc` or `~/.zshrc`)

3. Install [node.js](https://nodejs.org/en/download/) and update globally with `npm install npm@5.6.0 -g`

4. Install `Python` with `sudo apt-get install python`

5. Copy `curl -sSL http://bit.ly/2ysbOFE | bash -s` to your terminal to download all necessary samples, binaries and Docker images

The application has been developed on MacOS 10.15 Catalina. For more detailed information and instruction on how to install all necessary prerequisites also for other operating systems, we refer to the official [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/en/release-1.4/getting_started.html).

### Setting Up the Blockchain Application

Having installed all prerequisites, the following commands setup the network by executing the `startFabric.sh` script and installing all required node modules.

```bash
# Change to directory and start Fabric network
./cashflow/startFabric.sh

# Change to javascript folder and install all necessary node modules
cd javascript && npm install
```

After this setup, an admin user can be enrolled in the network.

```bash
# Register the admin user
node enrollAdmin.js
```

After enrolling the user, it is possible to register one or multiple users and interacting with the Blockchain network by executing `node query.js` and providing the name of the according function as argument.

```bash
# Register client users "Authority", "Construction Company" and "Architect"
# Flags (-a, -o, -c) specify the respective role
node registerUser.js -a Authority -o Construction\ Company -c Architect

# Create and sign a new legal agreement as organizer with the following parameters:
# > id: "LAG4", hash: "52ABC1042", amount: "10M", partner_1: "Construction Company", partner_2: "Architect"
node query.js organizer create LAG4 52ABC1042 10M Construction\ Company Architect

# Sign legal agreement "LAG4" as contractor and check the respective document
node query.js contractor sign LAG4
node query.js contractor query LAG4

# Query all agreements as authority
node query.js authority queryAll
```

### Docker Troubleshooting

The following commands will be performed within the `startFabric` script. However, if there seems to be an issue with Docker, it might help to reboot all containers and prune the images. Hence, the following commands might help here.

```bash
# Take the network down
.first-network/byfn.sh down

# Deletes all the dangling images
docker image prune –a

# Remove all the containers that are stopped in the application
docker container prune
```

## Authors

*[**Alex Kulikov**](https://github.com/alex-kulikov-git)
*[**Lukas Schöbel**](https://github.com/lukaschoebel)

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/lukaschoebel/cashflow/blob/develop/LICENSE) file for details.

## Acknowledgments

*We are very grateful to the entire Hyperledger Community, the [master repository](https://github.com/hyperledger/fabric) and the provided [samples](https://github.com/hyperledger/fabric-samples)
*Horea Porutiu, his [implementations](https://github.com/horeaporutiu/commercialPaperLoopback) and [videos](https://www.youtube.com/watch?v=1Evy4Zuppm0) on setting up Hyperledger Fabric