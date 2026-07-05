package autoflappy;

import java.awt.AWTException;
import java.awt.MouseInfo;
import java.awt.Rectangle;
import java.awt.Robot;
import java.awt.event.InputEvent;
import java.awt.image.BufferedImage;
import java.io.File;
import javax.imageio.ImageIO;
import java.util.Scanner;

public class AutoFlappy {
    private int gameLeft = 796;
    private int gameTop = 18;
    private int gameWidth = 458;
    private int gameHeight = 813;

    private int characterLeft = 925;
    private int characterRight = 1025;
    private int obstacleSearchLeft = 990;
    private int obstacleSearchRight = 1245;
    private int clickX = 1025;
    private int clickY = 425;

    private int targetMargin = 10;
    private int clickCooldownMs = 95;
    private int aimAboveGap = 20;

    private static final Scanner sc = new Scanner(System.in);

    private Robot robot;
    private long lastClickMs = 0;
    private int lastCharacterY = -1;

    public void run() {
        System.out.println("Top Heroes bounce test bot");
        System.out.println("Use only on your own local test build.");
        System.out.println("Move your mouse to the top-left corner to stop after it starts.");
        System.out.println();

        try {
            commandPrompt();
        } catch (AWTException e) {
            System.out.println("Error with Robot: " + e.getMessage());
        }
    }

    private void commandPrompt() throws AWTException {
        help();
        while (true) {
            System.out.println();
            System.out.print("Option: ");
            String input = sc.next();
            sc.nextLine();

            switch (input) {
                case "help":
                    help();
                    break;
                case "setup":
                    setupBot();
                    break;
                case "start":
                    startBot();
                    break;
                case "test":
                    testDetection();
                    break;
                case "quit":
                    System.out.println("Bye");
                    return;
                default:
                    System.out.println("Unknown option. Type help for options.");
            }
        }
    }

    private void startBot() throws AWTException {
        robot = new Robot();

        System.out.println("Starting in 3 seconds. Click your game window now.");
        robot.delay(3000);

        while (true) {
            java.awt.Point mouse = MouseInfo.getPointerInfo().getLocation();
            if (mouse.x <= 2 && mouse.y <= 2) {
                System.out.println("Stopped by top-left mouse failsafe.");
                return;
            }

            BufferedImage game = robot.createScreenCapture(new Rectangle(gameLeft, gameTop, gameWidth, gameHeight));
            int characterY = findCharacterY(game);
            Integer gapCenterY = findObstacleGapCenterY(game);

            String state = "waiting";
            if (characterY < 0) {
                state = "no character";
            } else if (gapCenterY == null) {
                state = "no obstacle";
            } else if (shouldClick(characterY, gapCenterY)) {
                state = "clicking";
                clickGame();
            }

            if (characterY >= 0) {
                lastCharacterY = characterY;
            }

            System.out.println(state + ": characterY=" + characterY + " gapCenterY=" + gapCenterY
                    + " targetY=" + (gapCenterY == null ? "none" : gapCenterY - aimAboveGap));
            robot.delay(30);
        }
    }

    private void testDetection() throws AWTException {
        robot = new Robot();
        BufferedImage game = robot.createScreenCapture(new Rectangle(gameLeft, gameTop, gameWidth, gameHeight));
        int characterY = findCharacterY(game);
        Integer gapCenterY = findObstacleGapCenterY(game);

        System.out.println("characterY=" + characterY);
        System.out.println("gapCenterY=" + gapCenterY);

        try {
            ImageIO.write(game, "png", new File("autoflappy-debug.png"));
            System.out.println("Saved current game crop to autoflappy-debug.png");
        } catch (Exception e) {
            System.out.println("Could not save debug image: " + e.getMessage());
        }
    }

    private int findCharacterY(BufferedImage game) {
        int xStart = Math.max(0, characterLeft - gameLeft);
        int xEnd = Math.min(gameWidth - 1, characterRight - gameLeft);
        int yStart = (int) (gameHeight * 0.25);
        int yEnd = (int) (gameHeight * 0.88);

        int weightedY = 0;
        int hits = 0;

        for (int y = yStart; y <= yEnd; y += 3) {
            int rowHits = 0;
            for (int x = xStart; x <= xEnd; x += 3) {
                int rgb = game.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;

                if (isCharacterPixel(r, g, b) && !isSolidPipePixel(r, g, b)) {
                    rowHits++;
                }
            }

            if (rowHits >= 2) {
                weightedY += y * rowHits;
                hits += rowHits;
            }
        }

        if (hits < 8) {
            return -1;
        }

        return weightedY / hits;
    }

    private Integer findObstacleGapCenterY(BufferedImage game) {
        int xStart = Math.max(0, obstacleSearchLeft - gameLeft);
        int xEnd = Math.min(gameWidth - 1, obstacleSearchRight - gameLeft);
        int yStart = (int) (gameHeight * 0.06);
        int yEnd = (int) (gameHeight * 0.94);

        Gap nearestGap = null;
        for (int x = xStart; x <= xEnd; x += 5) {
            Gap gap = findGapAtX(game, x, yStart, yEnd);
            if (gap != null) {
                nearestGap = gap;
                break;
            }
        }

        if (nearestGap == null) {
            return null;
        }

        return (nearestGap.startY + nearestGap.endY) / 2;
    }

    private Gap findGapAtX(BufferedImage game, int centerX, int yStart, int yEnd) {
        boolean[] obstacleRows = new boolean[gameHeight];
        for (int y = yStart; y <= yEnd; y += 3) {
            for (int x = Math.max(0, centerX - 10); x <= Math.min(gameWidth - 1, centerX + 10); x += 4) {
                int rgb = game.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;

                if (isSolidPipePixel(r, g, b)) {
                    obstacleRows[y] = true;
                    break;
                }
            }
        }

        Gap bestGap = null;
        int currentGapStart = -1;

        for (int y = yStart; y <= yEnd; y += 3) {
            if (!obstacleRows[y]) {
                if (currentGapStart < 0) {
                    currentGapStart = y;
                }
            } else if (currentGapStart >= 0) {
                Gap gap = buildGapIfPlayable(obstacleRows, currentGapStart, y, yStart, yEnd, centerX);
                if (gap != null && (bestGap == null || gap.score > bestGap.score)) {
                    bestGap = gap;
                }
                currentGapStart = -1;
            }
        }

        if (currentGapStart >= 0) {
            Gap gap = buildGapIfPlayable(obstacleRows, currentGapStart, yEnd, yStart, yEnd, centerX);
            if (gap != null && (bestGap == null || gap.score > bestGap.score)) {
                bestGap = gap;
            }
        }

        return bestGap;
    }

    private Gap buildGapIfPlayable(boolean[] obstacleRows, int gapStart, int gapEnd, int yStart, int yEnd, int centerX) {
        int gapSize = gapEnd - gapStart;
        if (gapSize < 95 || gapSize > 430) {
            return null;
        }

        int obstacleAbove = countObstacleRows(obstacleRows, Math.max(yStart, gapStart - 140), gapStart);
        int obstacleBelow = countObstacleRows(obstacleRows, gapEnd, Math.min(yEnd, gapEnd + 140));
        if (obstacleAbove < 4 || obstacleBelow < 4) {
            return null;
        }

        int center = (gapStart + gapEnd) / 2;
        int score = 1000 - Math.abs(center - gameHeight / 2) + Math.min(gapSize, 180);

        return new Gap(gapStart, gapEnd, score);
    }

    private int countObstacleRows(boolean[] obstacleRows, int start, int end) {
        int count = 0;
        for (int y = start; y <= end && y < obstacleRows.length; y += 3) {
            if (obstacleRows[y]) {
                count++;
            }
        }
        return count;
    }

    private boolean shouldClick(int characterY, int gapCenterY) {
        long now = System.currentTimeMillis();
        if (now - lastClickMs < clickCooldownMs) {
            return false;
        }

        int targetY = gapCenterY - aimAboveGap;
        int distanceBelowTarget = characterY - targetY;
        int fallSpeed = lastCharacterY < 0 ? 0 : characterY - lastCharacterY;
        boolean fallingOrFlat = fallSpeed >= -4;

        return (distanceBelowTarget > targetMargin && fallingOrFlat)
                || (fallSpeed > 10 && distanceBelowTarget > -30);
    }

    private void clickGame() {
        long now = System.currentTimeMillis();

        robot.mouseMove(clickX, clickY);
        robot.mousePress(InputEvent.BUTTON1_DOWN_MASK);
        robot.delay(35);
        robot.mouseRelease(InputEvent.BUTTON1_DOWN_MASK);
        lastClickMs = now;
    }

    private boolean isCharacterPixel(int r, int g, int b) {
        boolean brightBody = r > 145 && g > 40 && g < 200 && b < 140 && r - b > 45;
        boolean dimBody = r < 115 && g < 120 && b < 95 && max(r, g, b) - min(r, g, b) > 12;
        return brightBody || dimBody;
    }

    private boolean isSolidPipePixel(int r, int g, int b) {
        if (isOpenWaterPixel(r, g, b)) {
            return false;
        }

        boolean stone = r > 120 && r < 235
                && g > 130 && g < 245
                && b > 100 && b < 230
                && Math.abs(r - b) < 60
                && g >= r - 15;

        boolean dimStone = r > 35 && r < 120
                && g > 40 && g < 130
                && b > 30 && b < 125
                && max(r, g, b) - min(r, g, b) < 45
                && g >= b - 8;

        boolean moss = g > 105 && r > 35 && r < 150 && b < 80 && g - b > 45;
        return stone || dimStone || moss;
    }

    private boolean isOpenWaterPixel(int r, int g, int b) {
        return b > 120 && g > 95 && b > r + 35 && g > r + 25;
    }

    private int max(int a, int b, int c) {
        return Math.max(a, Math.max(b, c));
    }

    private int min(int a, int b, int c) {
        return Math.min(a, Math.min(b, c));
    }

    private void setupBot() {
        System.out.println("Game left x:");
        gameLeft = sc.nextInt();

        System.out.println("Game top y:");
        gameTop = sc.nextInt();

        System.out.println("Game width:");
        gameWidth = sc.nextInt();

        System.out.println("Game height:");
        gameHeight = sc.nextInt();

        System.out.println("Character search left x:");
        characterLeft = sc.nextInt();

        System.out.println("Character search right x:");
        characterRight = sc.nextInt();

        System.out.println("Obstacle search left x:");
        obstacleSearchLeft = sc.nextInt();

        System.out.println("Obstacle search right x:");
        obstacleSearchRight = sc.nextInt();

        System.out.println("Fixed click x:");
        clickX = sc.nextInt();

        System.out.println("Fixed click y:");
        clickY = sc.nextInt();
    }

    private void help() {
        System.out.println("help  - show this menu");
        System.out.println("setup - change game window/search areas");
        System.out.println("test  - detect character and pipe without clicking");
        System.out.println("start - start the bot");
        System.out.println("quit  - exit");
    }

    private static class Gap {
        final int startY;
        final int endY;
        final int score;

        Gap(int startY, int endY, int score) {
            this.startY = startY;
            this.endY = endY;
            this.score = score;
        }
    }
}
