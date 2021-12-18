# Cartoon CLI

CLI for watching and browsing Cartoons

# Downlaod

```
npm i cartoon-cli -g
```

# Usage

## Set Settings

#### Download

```
 # downloads episode mp4
cartoon --download=true

 # saves episode info in json file
cartoon --download=false

```

#### File Directory

```
 # Changes default path
cartoon --path=D:/Desktop/Cartoons/rick_and_morty.json

 # One-time change
cartoon --specify=C:/Documents/Cartoons/ben_10.json

# or specify after:
cartoon samurai jack --specify

```

## Example

```
cartoon samurai jack

Getting Results...

[0]--Samurai Jack Season 1
[1]--Samurai Jack Season 2
[2]--Samurai Jack Season 3
[3]--Samurai Jack Season 4
[4]--Samurai Jack Season 5
Choose Index : 0
Starting To Fetch Every Episode...

```
