'use strict'
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const chalk = require('chalk');

const options = yargs
.usage("Usage -n <name>")
.option("d", {
    alias:'directory',
    describe:'Root directory where files are',
    type: "string",
    demandOption:true,
    
})
.option("b",{
    alias: 'base',
    describe:'Base path to be prefixed to the file name and root dir name'
})
.argv

const toScan = options.d?options.d:process.cwd();
const toWrite = options.t?options.t:process.cwd();
const base = '/';

walk(toScan,(err,data,sections)=>{
    if(err) return console.log(chalk.red(err.toString()))
    let toJSON = {
        sections: [],
        pageData:{
            links:[]
        }
    };

    if(sections&&sections.length){
        sections.forEach(section=>{
            toJSON.sections.push({
                // Add Required Fields here
                id:section,
                title:'',
            }) 
        })
    };

    toJSON.pageData.links = toJSON.pageData.links.concat(data);

    fs.writeFileSync(toWrite+'.json',JSON.stringify(toJSON))
    
    return console.log(JSON)
});

// TODO: Recursively Scan until file_list is of zero length
function walk (dir,done){
    console.log(chalk.yellow.bold('Scanning Directory ') + dir);
    let data = [];
    let sections = [];

    fs.readdir(dir,function(err,list){
        if(err) return done(err,null);
        let pending = list.length;
        if(!pending) return done(null,data,sections);
        list.forEach(function(file){

            file = path.resolve(dir,file);
            let parent = path.dirname(file).split(path.sep).pop();
            let filename = path.basename(file).split('.')[0];

            fs.stat(file,(err,stat)=>{
                if(err) done(err);
                if(stat&&stat.isDirectory()){
                    walk(file,(err,data_,sections_)=>{
                        if(err) return;
                        data = data.concat(data_);
                        sections = sections.concat(sections_);
                        if(!--pending) done(null,data,sections)
                    })
                }else{
                    // Add to the JSON
                    if(!sections.includes(parent)) sections.push(parent);
                    
                    data.push({
                        parent,
                        link:base + '/' + parent + '/' + filename,
                        title:filename,
                        linkText:'',
                        thumbnail:'',
                    })
                    if(!--pending) done(null,data,sections)
                }
            });
        })
    })

  
}





