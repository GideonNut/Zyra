import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface GlobalSettings {
  feeRecipient?: string;
}

const SETTINGS_FILE = join(process.cwd(), 'data', 'global-settings.json');

async function readSettings(): Promise<GlobalSettings> {
  try {
    const content = await readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function writeSettings(settings: GlobalSettings): Promise<void> {
  try {
    await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write settings file:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const settings = await readSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error reading settings:', error);
    return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    await writeSettings(body);
    return NextResponse.json(body);
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
