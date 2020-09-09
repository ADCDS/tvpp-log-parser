# TVPP Log Parser

A JS platform that can read [TVPP](https://github.com/eliseumiguel/TVPP-DEV) logs and draw its respective graphs.

![Graph generation](https://user-images.githubusercontent.com/6514747/92659780-6c754c00-f2cf-11ea-8e4f-de64f686ddb6.gif)

## Install
Install git & node:

    apt-get install git nodejs
	
Clone repo:

    git clone https://github.com/ADCDS/tvpp-log-parser.git
    
Install dependencies:

    cd tvpp-log-parser/
	npm install


## Usage

Run:

    gulp

Will start a webserver on the port 3000

After loading the page at http://localhost:3000, load the overlay log first, and then the performance log.
Example logs can be found at [logs/](https://github.com/ADCDS/tvpp-log-parser/tree/master/logs) 

## License

MIT © [Adriel Santos](https://github.com/ADCDS)
