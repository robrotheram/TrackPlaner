import { TrackPointPiece } from "./point"

test("test point", () => {
    const track = new TrackPointPiece("", 100, 100, 0, 0, 22.5, 438)
    expect(track.isSelectable(533,200)).toBe(true)
})