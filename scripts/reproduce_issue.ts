import ImageKit from 'imagekit';
import fs from 'fs';

// Mock credentials
const imagekit = new ImageKit({
    publicKey: 'public_test',
    privateKey: 'private_test',
    urlEndpoint: 'https://ik.imagekit.io/test'
});

const variations = [
    { name: 'raw: e-bgremove', trans: { raw: 'e-bgremove' } },
    { name: 'raw: e-removedotbg', trans: { raw: 'e-removedotbg' } },
    { name: 'e-bgremove: true', trans: { 'e-bgremove': 'true' } },
    { name: 'e-bgremove: ""', trans: { 'e-bgremove': '' } },
];

let output = '';

variations.forEach(v => {
    try {
        const url = imagekit.url({
            src: 'https://ik.imagekit.io/test/image.jpg',
            // @ts-ignore
            transformation: [v.trans]
        });
        output += `Variation: ${v.name}\nURL: ${url}\n\n`;
    } catch (e: any) {
        output += `Variation: ${v.name}\nError: ${e.message}\n\n`;
    }
});

fs.writeFileSync('debug_output_2.txt', output);
console.log('Debug output written to debug_output_2.txt');
