/**
 * @jest-environment jsdom
 */
import { TrackStraightPiece, TrackCurvedPiece } from '../../lib/Track';

describe('TrackStraightPiece', () => {
    const piece = new TrackStraightPiece("S 100", 50, 50, 0, 100);
    const mockCtx = {
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        closePath: jest.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0
    } as unknown as CanvasRenderingContext2D;

    it('should create a straight track piece', () => {
        expect(piece.x).toBe(50);
        expect(piece.y).toBe(50);
        expect(piece.rotation).toBe(0);
        expect(piece.length).toBe(100);
        expect(piece.code).toBe("S 100");
    });

    it('should be selectable within bounds', () => {
        expect(piece.isSelectable(75, 50)).toBe(true);
    });

    it('should not be selectable outside bounds', () => {
        expect(piece.isSelectable(200, 50)).toBe(false);
    });

    it('should clone correctly', () => {
        const clone = piece.clone();
        expect(clone).not.toBe(piece);
        expect(clone).toEqual(piece);
    });

    it('should draw correctly', () => {
        piece.draw(mockCtx);
        expect(mockCtx.save).toHaveBeenCalled();
        expect(mockCtx.restore).toHaveBeenCalled();
        expect(mockCtx.translate).toHaveBeenCalledWith(100, 50);
        expect(mockCtx.rotate).toHaveBeenCalledWith(0);
        expect(mockCtx.beginPath).toHaveBeenCalled();
        expect(mockCtx.moveTo).toHaveBeenCalledWith(-50, -4);
        expect(mockCtx.lineTo).toHaveBeenCalledWith(50, -4);
        expect(mockCtx.moveTo).toHaveBeenCalledWith(-50, 4);
        expect(mockCtx.lineTo).toHaveBeenCalledWith(50, 4);
        expect(mockCtx.stroke).toHaveBeenCalled();
    });
});

describe('TrackCurvedPiece', () => {
    const piece = new TrackCurvedPiece("R 606", 127, 520, 270, 180, 225, 335);
    const mockCtx = {
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        closePath: jest.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0
    } as unknown as CanvasRenderingContext2D;

    it('should create a curved track piece', () => {
        expect(piece.x).toBe(127);
        expect(piece.y).toBe(520);
        expect(piece.rotation).toBe(270);
        expect(piece.startAngle).toBe(180);
        expect(piece.endAngle).toBe(225);
        expect(piece.radius).toBe(335);
        expect(piece.code).toBe("R 606");
    });

    it('should be selectable within bounds', () => {
        expect(piece.isSelectable(-178, 370, 20)).toBe(true);
    });

    it('should not be selectable outside bounds', () => {
        expect(piece.isSelectable(0, 0)).toBe(false);
    });

    it('should clone correctly', () => {
        const clone = piece.clone();
        expect(clone).not.toBe(piece);
        expect(clone).toEqual(piece);
    });

    it('should draw correctly', () => {
        piece.draw(mockCtx);
        expect(mockCtx.save).toHaveBeenCalled();
        expect(mockCtx.restore).toHaveBeenCalled();
        expect(mockCtx.translate).toHaveBeenCalledWith(127, 520);
        expect(mockCtx.beginPath).toHaveBeenCalled();
        expect(mockCtx.arc).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), 331, expect.any(Number), expect.any(Number));
        expect(mockCtx.arc).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), 339, expect.any(Number), expect.any(Number));
        expect(mockCtx.stroke).toHaveBeenCalled();
    });
});
