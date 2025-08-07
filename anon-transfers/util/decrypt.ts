// import { Signer } from "ethers";
import { FhevmInstance } from "@zama-fhe/relayer-sdk";

// const EBOOL_T = 0;
// const EUINT4_T = 1;
// const EUINT8_T = 2;
// const EUINT16_T = 3;
// const EUINT32_T = 4;
// const EUINT64_T = 5;
// const EUINT128_T = 6;
// const EUINT160_T = 7; // @dev It is the one for eaddresses.
// const EUINT256_T = 8;
// const EBYTES64_T = 9;
// const EBYTES128_T = 10;
// const EBYTES256_T = 11;

// export function verifyType(handle: bigint, expectedType: number) {
//     if (handle === 0n) {
//         throw "Handle is not initialized";
//     }

//     if (handle.toString(2).length > 256) {
//         throw "Handle is not a bytes32";
//     }

//     const typeCt = handle >> 8n;

//     if (Number(typeCt % 256n) !== expectedType) {
//         throw "Wrong encrypted type for the handle";
//     }
// }

// export async function reencryptEbool(
//     signer: Signer,
//     instance: FhevmInstance,
//     handle: bigint,
//     contractAddress: string,
// ): Promise<boolean> {
//     verifyType(handle, EBOOL_T);
//     return (await reencryptHandle(signer, instance, handle, contractAddress)) === 1n;
// }

// export async function reencryptEuint4(
//     signer: Signer,
//     instance: FhevmInstance,
//     handle: bigint,
//     contractAddress: string,
// ): Promise<bigint> {
//     verifyType(handle, EUINT4_T);
//     return reencryptHandle(signer, instance, handle, contractAddress);
// }

// export async function reencryptEuint8(
//     signer: Signer,
//     instance: FhevmInstance,
//     handle: bigint,
//     contractAddress: string,
// ): Promise<bigint> {
//     verifyType(handle, EUINT8_T);
//     return reencryptHandle(signer, instance, handle, contractAddress);
// }

// export async function reencryptEuint16(
//     signer: Signer,
//     instance: FhevmInstance,
//     handle: bigint,
//     contractAddress: string,
// ): Promise<bigint> {
//     verifyType(handle, EUINT16_T);
//     return reencryptHandle(signer, instance, handle, contractAddress);
// }

// export async function reencryptEuint32(
//     signer: Signer,
//     instance: FhevmInstance,
//     handle: bigint,
//     contractAddress: string,
// ): Promise<bigint> {
//     verifyType(handle, EUINT32_T);
//     return reencryptHandle(signer, instance, handle, contractAddress);
// }

// export async function reencryptEuint64(
//     signer: Signer,
//     instance: FhevmInstance,
//     handle: bigint,
//     contractAddress: string,
// ): Promise<bigint> {
//     verifyType(handle, EUINT64_T);
//     return reencryptHandle(signer, instance, handle, contractAddress);
// }

// export async function reencryptEuint128(
//     signer: Signer,
//     instance: FhevmInstance,
//     handle: bigint,
//     contractAddress: string,
// ): Promise<bigint> {
//     verifyType(handle, EUINT128_T);
//     return reencryptHandle(signer, instance, handle, contractAddress);
// }

// export async function reencryptEaddress(
//     signer: Signer,
//     instance: FhevmInstance,
//     handle: bigint,
//     contractAddress: string,
// ): Promise<string> {
//     verifyType(handle, EUINT160_T);
//     const addressAsUint160: bigint = await reencryptHandle(signer, instance, handle, contractAddress);
//     const handleStr = "0x" + addressAsUint160.toString(16).padStart(40, "0");
//     return handleStr;
// }

// export async function reencryptEuint256(
//     signer: Signer,
//     instance: FhevmInstance,
//     handle: bigint,
//     contractAddress: string,
// ): Promise<bigint> {
//     verifyType(handle, EUINT256_T);
//     return reencryptHandle(signer, instance, handle, contractAddress);
// }

// export async function reencryptEbytes64(
//     signer: Signer,
//     instance: FhevmInstance,
//     handle: bigint,
//     contractAddress: string,
// ): Promise<bigint> {
//     verifyType(handle, EBYTES64_T);
//     return reencryptHandle(signer, instance, handle, contractAddress);
// }

// export async function reencryptEbytes128(
//     signer: Signer,
//     instance: FhevmInstance,
//     handle: bigint,
//     contractAddress: string,
// ): Promise<bigint> {
//     verifyType(handle, EBYTES128_T);
//     return reencryptHandle(signer, instance, handle, contractAddress);
// }

// export async function reencryptEbytes256(
//     signer: Signer,
//     instance: FhevmInstance,
//     handle: bigint,
//     contractAddress: string,
// ): Promise<bigint> {
//     verifyType(handle, EBYTES256_T);
//     return reencryptHandle(signer, instance, handle, contractAddress);
// }

// /**
//  * @dev This function is to reencrypt handles.
//  *      It does not verify types.
//  */
// async function reencryptHandle(
//     signer: Signer,
//     instance: FhevmInstance,
//     handle: bigint,
//     contractAddress: string,
// ): Promise<any> {
//     // Step 1: Generate keypair
//     const { publicKey, privateKey } = instance.generateKeypair();

//     // Step 2: Prepare EIP712 message
//     const contractAddresses = [contractAddress]; // wrap in array
//     const startTimestamp = Math.floor(Date.now() / 1000); // now in seconds
//     const durationDays = 7; // valid for 7 days

//     const eip712 = instance.createEIP712(
//         publicKey,
//         contractAddresses,
//         startTimestamp,
//         durationDays
//     );

//     // Step 3: Sign EIP712 message
//     const signature = await signer.signTypedData(
//         eip712.domain,
//         eip712.types,
//         eip712.message
//     );

//     // Step 4: Re-encrypt using handle and keys
//     const reencryptedHandle = await instance.reencrypt(
//         handle,
//         privateKey,
//         publicKey,
//         signature.replace("0x", ""),
//         contractAddress,
//         await signer.getAddress()
//     );

//     return reencryptedHandle;
// }
