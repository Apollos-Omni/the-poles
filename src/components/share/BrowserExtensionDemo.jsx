
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Chrome, 
  Flame, // Changed from Firefox to Flame
  Globe, 
  ExternalLink,
  Download,
  CheckCircle2,
  Mouse
} from 'lucide-react';

export default function BrowserExtensionDemo({ onProductShared }) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [lastSharedUrl, setLastSharedUrl] = useState('');

  // Simulate browser extension context menu action
  const simulateExtensionShare = async (sampleUrl) => {
    setLastSharedUrl(sampleUrl);
    
    // Simulate the extension API call
    const mockResponse = {
      productId: `prod_${Math.random().toString(36).substr(2, 9)}`,
      retailer: sampleUrl.includes('amazon') ? 'amazon' : 
                sampleUrl.includes('walmart') ? 'walmart' : 'bestbuy',
      canonicalUrl: sampleUrl.split('?')[0], // Strip query params
      title: sampleUrl.includes('amazon') ? "Echo Dot (5th Gen)" :
             sampleUrl.includes('walmart') ? "Nintendo Switch OLED" :
             "Apple AirPods Pro",
      image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=300&h=300&fit=crop",
      priceCents: Math.floor(Math.random() * 50000) + 2000, // $20-$520 range
      currency: "USD",
      priceExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      affiliate: { tag: "santaclause-20", link: sampleUrl + "?tag=santaclause-20" }
    };

    // Simulate opening new tab with product
    if (onProductShared) {
      onProductShared(mockResponse);
    }
    
    return mockResponse;
  };

  const extensionManifest = {
    "manifest_version": 3,
    "name": "Santa Clause Prize Matcher",
    "version": "1.0",
    "description": "Turn any product into a skill-based prize match",
    "permissions": ["contextMenus", "tabs", "activeTab"],
    "host_permissions": [
      "https://amazon.com/*",
      "https://*.amazon.com/*", 
      "https://walmart.com/*",
      "https://bestbuy.com/*",
      "https://target.com/*",
      "https://ebay.com/*"
    ],
    "background": {
      "service_worker": "background.js"
    },
    "icons": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png", 
      "128": "icons/icon-128.png"
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Chrome className="w-5 h-5 text-blue-600" />
            Browser Extension Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Right-click any product page and select "Share to Santa Clause" from the context menu.
            </p>

            {!isInstalled ? (
              <div className="flex gap-3">
                <Button 
                  onClick={() => setIsInstalled(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Install Chrome Extension
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsInstalled(true)}
                  className="flex items-center gap-2"
                >
                  <Flame className="w-4 h-4 text-orange-500" /> {/* Changed from Firefox to Flame */}
                  Install Firefox Add-on
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Extension installed! Try right-clicking below:</span>
                </div>

                {/* Simulated Product Pages */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Card 
                    className="cursor-pointer hover:shadow-md transition-shadow border border-gray-300"
                    onClick={() => simulateExtensionShare('https://www.amazon.com/dp/B08N5WRWNW?ref=sr_1_3')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <img src="https://logo.clearbit.com/amazon.com" alt="Amazon" className="w-4 h-4" />
                        <span className="text-sm font-medium">Amazon</span>
                      </div>
                      <p className="text-sm text-gray-600">Echo Dot (5th Generation)</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Mouse className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">Right-click to share</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="cursor-pointer hover:shadow-md transition-shadow border border-gray-300"
                    onClick={() => simulateExtensionShare('https://www.walmart.com/ip/Nintendo-Switch-Console/55126484')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <img src="https://logo.clearbit.com/walmart.com" alt="Walmart" className="w-4 h-4" />
                        <span className="text-sm font-medium">Walmart</span>
                      </div>
                      <p className="text-sm text-gray-600">Nintendo Switch OLED</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Mouse className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">Right-click to share</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="cursor-pointer hover:shadow-md transition-shadow border border-gray-300"
                    onClick={() => simulateExtensionShare('https://www.bestbuy.com/site/apple-airpods-pro/6418599.p')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <img src="https://logo.clearbit.com/bestbuy.com" alt="Best Buy" className="w-4 h-4" />
                        <span className="text-sm font-medium">Best Buy</span>
                      </div>
                      <p className="text-sm text-gray-600">Apple AirPods Pro</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Mouse className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">Right-click to share</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {lastSharedUrl && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-800 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-medium">Product shared successfully!</span>
                    </div>
                    <p className="text-green-700 text-xs mt-1">
                      Opened new tab: santaclause.app/share/prod_abc123
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PWA Share Target */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-600" />
            PWA Share Target
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              On macOS and Android, you can share URLs directly to Santa Clause from the system share menu.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Web App Manifest</h4>
              <pre className="text-xs text-gray-600 overflow-x-auto">
{`"share_target": {
  "action": "/web-share",
  "method": "POST",
  "enctype": "application/x-www-form-urlencoded", 
  "params": { "url": "link" }
}`}
              </pre>
            </div>

            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800">macOS Safari</Badge>
              <Badge className="bg-green-100 text-green-800">Android Chrome</Badge>
              <Badge className="bg-gray-100 text-gray-600">iOS (Future)</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Implementation */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Extension Manifest & Background Script</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">manifest.json</h4>
              <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(extensionManifest, null, 2)}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">background.js</h4>
              <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
{`chrome.contextMenus.create({
  id: "share-to-santa",
  title: "Share to Santa Clause", 
  contexts: ["page"]
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const url = info.pageUrl || tab?.url;
  if (!url) return;
  
  const response = await fetch(API + "/v1/ingest/share", {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      url, 
      source: "extension",
      userId: await getUserId()
    })
  });
  
  const result = await response.json();
  chrome.tabs.create({ 
    url: WEB + "/share/" + result.productId 
  });
});`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
