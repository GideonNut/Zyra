import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance } from '@/lib/firestore';

interface GlobalSettings {
  feeRecipient?: string;
  updatedAt?: number;
}

const SETTINGS_COLLECTION = 'globalSettings';
const SETTINGS_DOC = 'platformConfig';

async function readSettings(): Promise<GlobalSettings> {
  try {
    const db = getFirestoreInstance();
    const docRef = db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC);
    const doc = await docRef.get();
    
    if (doc.exists) {
      return doc.data() as GlobalSettings;
    }
    return {};
  } catch (error) {
    console.error('Failed to read settings from Firestore:', error);
    throw error;
  }
}

async function writeSettings(settings: GlobalSettings): Promise<void> {
  try {
    const db = getFirestoreInstance();
    const docRef = db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC);
    
    await docRef.set({
      ...settings,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (error) {
    console.error('Failed to write settings to Firestore:', error);
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
    const updatedSettings = await readSettings();
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
