export function generateRoomCode() {
  return Math.floor(100000000 + Math.random() * 900000000).toString(); // 9-digit
}

export function generatePin() {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit
}
