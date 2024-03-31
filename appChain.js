import appChain from "chain";
const startClient = () => {
    alicePrivateKey = PrivateKey.random();
    alice = alicePrivateKey.toPublicKey();
    appChain.start().then( () => {appChain.setSigner(alicePrivateKey); return appChain;});
}
export default startClient;