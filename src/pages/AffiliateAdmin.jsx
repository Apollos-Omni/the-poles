import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AffiliateAdminMerchants from "@/components/affiliate-admin/AffiliateAdminMerchants";
import AffiliateAdminOffers from "@/components/affiliate-admin/AffiliateAdminOffers";
import AffiliateAdminClicks from "@/components/affiliate-admin/AffiliateAdminClicks";
import AffiliateAdminApplications from "@/components/affiliate-admin/AffiliateAdminApplications";
import { MediaHero, VideoBackgroundCard, mediaImages } from "@/components/media/MediaPrimitives";

export default function AffiliateAdmin() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/ThePoles" className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white">Affiliate Admin</h1>
            <p className="text-purple-300/60 text-sm">Manage merchants, offers, clicks, and applications</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-purple-700/20">
          <MediaHero
            eyebrow="Affiliate admin"
            title="Build a sponsor-ready prize marketplace."
            description="Merchant relationships, offer images, catalog quality, and campaign tracking should feel like a premium product discovery system."
            image={mediaImages.sponsorMarket}
            badges={["Merchants", "Offers", "Clicks", "Applications"]}
          >
            <VideoBackgroundCard title="Product campaign room" description="Use polished media and clear disclosures so offers feel trustworthy before they go public." image={mediaImages.catalogShelf} label="Marketplace" metric="Admin" />
          </MediaHero>
        </div>

        <Tabs defaultValue="merchants">
          <TabsList className="bg-black/40 border border-purple-700/20">
            <TabsTrigger value="merchants" className="data-[state=active]:bg-purple-800">Merchants</TabsTrigger>
            <TabsTrigger value="offers" className="data-[state=active]:bg-purple-800">Offers</TabsTrigger>
            <TabsTrigger value="clicks" className="data-[state=active]:bg-purple-800">Click Analytics</TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-purple-800">Applications</TabsTrigger>
          </TabsList>
          <TabsContent value="merchants"><AffiliateAdminMerchants /></TabsContent>
          <TabsContent value="offers"><AffiliateAdminOffers /></TabsContent>
          <TabsContent value="clicks"><AffiliateAdminClicks /></TabsContent>
          <TabsContent value="applications"><AffiliateAdminApplications /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
