<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:d="http://cpee.org/ns/description/1.0">
  <xsl:output method="text" indent="no"/>
  <xsl:strip-space elements="*"/>
  <xsl:variable name="myspacemultiplier">2</xsl:variable>

  <xsl:template match="/">
    <xsl:apply-templates select="//d:description"/>
  </xsl:template>

  <xsl:template match="//d:description">
    <xsl:apply-templates>
      <xsl:with-param name="myspace"><xsl:value-of select="-1*$myspacemultiplier"/></xsl:with-param>
    </xsl:apply-templates>  
  </xsl:template>

  <xsl:template match="*">
    <xsl:param name="myspace"/>
    <xsl:call-template name="print-space">
      <xsl:with-param name="i">1</xsl:with-param>
      <xsl:with-param name="count"><xsl:value-of select="$myspace+$myspacemultiplier"/></xsl:with-param>
    </xsl:call-template>
    <xsl:if test="name()='call'">
      <xsl:text>activity :</xsl:text>
      <xsl:value-of select="@id"/>
      <xsl:text>, :call, :</xsl:text>
      <xsl:value-of select="@endpoint"/>
      <xsl:apply-templates select="d:parameter"/>
      <xsl:apply-templates select="d:manipulate" mode="part-of-call">
        <xsl:with-param name="myspace"><xsl:value-of select="$myspace"/></xsl:with-param>
      </xsl:apply-templates>
      <xsl:value-of select="'&#xA;'"/>
    </xsl:if>
    <xsl:if test="name()='manipulate'">
      <xsl:text>activity :</xsl:text>
      <xsl:value-of select="@id"/>
      <xsl:text>, :manipulate</xsl:text>
      <xsl:call-template name="print-content">
        <xsl:with-param name="myspace"><xsl:value-of select="$myspace"/></xsl:with-param>
      </xsl:call-template>
      <xsl:value-of select="'&#xA;'"/>
    </xsl:if>
    <xsl:if test="name()='parallel'">
      <xsl:text>parallel</xsl:text>
      <xsl:if test="@wait">
        <xsl:text> :wait => </xsl:text>
        <xsl:value-of select="@wait"/>
      </xsl:if>
      <xsl:text> do</xsl:text>
      <xsl:value-of select="'&#xA;'"/>
      <xsl:apply-templates>
        <xsl:with-param name="myspace"><xsl:value-of select="$myspace+$myspacemultiplier"/></xsl:with-param>
      </xsl:apply-templates>
      <xsl:call-template name="print-space">
        <xsl:with-param name="i">1</xsl:with-param>
        <xsl:with-param name="count"><xsl:value-of select="$myspace+$myspacemultiplier"/></xsl:with-param>
      </xsl:call-template>
      <xsl:text>end</xsl:text>
      <xsl:value-of select="'&#xA;'"/>
    </xsl:if>
    <xsl:if test="name()='choose'">
      <xsl:text>choose do</xsl:text>
      <xsl:value-of select="'&#xA;'"/>
      <xsl:apply-templates>
        <xsl:with-param name="myspace"><xsl:value-of select="$myspace+$myspacemultiplier"/></xsl:with-param>
      </xsl:apply-templates>
      <xsl:call-template name="print-space">
        <xsl:with-param name="i">1</xsl:with-param>
        <xsl:with-param name="count"><xsl:value-of select="$myspace+$myspacemultiplier"/></xsl:with-param>
      </xsl:call-template>
      <xsl:text>end</xsl:text>
      <xsl:value-of select="'&#xA;'"/>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="d:alternative">
    <xsl:param name="myspace"/>
    <xsl:call-template name="print-space">
      <xsl:with-param name="i">1</xsl:with-param>
      <xsl:with-param name="count"><xsl:value-of select="$myspace+$myspacemultiplier"/></xsl:with-param>
    </xsl:call-template>
    <xsl:text>alternative("</xsl:text>
    <xsl:value-of select="@condition"/>
    <xsl:text>") do</xsl:text>
    <xsl:value-of select="'&#xA;'"/>
    <xsl:apply-templates>
      <xsl:with-param name="myspace"><xsl:value-of select="$myspace+$myspacemultiplier"/></xsl:with-param>
    </xsl:apply-templates>
    <xsl:call-template name="print-space">
      <xsl:with-param name="i">1</xsl:with-param>
      <xsl:with-param name="count"><xsl:value-of select="$myspace+$myspacemultiplier"/></xsl:with-param>
    </xsl:call-template>
    <xsl:text>end</xsl:text>
    <xsl:value-of select="'&#xA;'"/>
  </xsl:template>

  <xsl:template match="d:otherwise">
    <xsl:param name="myspace"/>
    <xsl:call-template name="print-space">
      <xsl:with-param name="i">1</xsl:with-param>
      <xsl:with-param name="count"><xsl:value-of select="$myspace+$myspacemultiplier"/></xsl:with-param>
    </xsl:call-template>
    <xsl:text>otherwise do</xsl:text>
    <xsl:value-of select="'&#xA;'"/>
    <xsl:apply-templates>
      <xsl:with-param name="myspace"><xsl:value-of select="$myspace+$myspacemultiplier"/></xsl:with-param>
    </xsl:apply-templates>
    <xsl:call-template name="print-space">
      <xsl:with-param name="i">1</xsl:with-param>
      <xsl:with-param name="count"><xsl:value-of select="$myspace+$myspacemultiplier"/></xsl:with-param>
    </xsl:call-template>
    <xsl:text>end</xsl:text>
    <xsl:value-of select="'&#xA;'"/>
  </xsl:template>

  <xsl:template match="d:parallel_branch">
    <xsl:param name="myspace"/>
    <xsl:call-template name="print-space">
      <xsl:with-param name="i">1</xsl:with-param>
      <xsl:with-param name="count"><xsl:value-of select="$myspace+$myspacemultiplier"/></xsl:with-param>
    </xsl:call-template>
    <xsl:text>parallel_branch do</xsl:text>
    <xsl:value-of select="'&#xA;'"/>
    <xsl:apply-templates>
      <xsl:with-param name="myspace"><xsl:value-of select="$myspace+$myspacemultiplier"/></xsl:with-param>
    </xsl:apply-templates>
    <xsl:call-template name="print-space">
      <xsl:with-param name="i">1</xsl:with-param>
      <xsl:with-param name="count"><xsl:value-of select="$myspace+$myspacemultiplier"/></xsl:with-param>
    </xsl:call-template>
    <xsl:text>end</xsl:text>
    <xsl:value-of select="'&#xA;'"/>
  </xsl:template>

  <xsl:template match="d:parameter">
    <xsl:text>, :</xsl:text>
    <xsl:value-of select="@name"/>
    <xsl:text> => </xsl:text>
    <xsl:choose>  
      <xsl:when test="count(*) > 0">
        <xsl:text>[</xsl:text>
        <xsl:apply-templates select="d:parameter" mode="sub-parameter"/>
        <xsl:text>]</xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <xsl:text>"</xsl:text>
        <xsl:value-of select="text()"/>
        <xsl:text>"</xsl:text>
      </xsl:otherwise>
    </xsl:choose>  
  </xsl:template>
  
  <xsl:template match="d:parameter" mode="sub-parameter">
    <xsl:text> { :</xsl:text>
    <xsl:value-of select="@name"/>
    <xsl:text> => </xsl:text>
    <xsl:text>"</xsl:text>
    <xsl:value-of select="text()"/>
    <xsl:text>"</xsl:text>
    <xsl:text> }</xsl:text>
    <xsl:choose>  
      <xsl:when test=". = ../*[last()]">
        <xsl:text> </xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <xsl:text>,</xsl:text>
      </xsl:otherwise>
    </xsl:choose>  
  </xsl:template>

  <xsl:template match="d:manipulate" mode="part-of-call">
    <xsl:param name="myspace"/>
    <xsl:call-template name="print-content">
      <xsl:with-param name="myspace"><xsl:value-of select="$myspace"/></xsl:with-param>
    </xsl:call-template>
  </xsl:template>

  <xsl:template name="print-content">
    <xsl:param name="myspace"/>
    <xsl:if test="text()">
      <xsl:text> do </xsl:text>
      <xsl:if test="@output">
        <xsl:text>|</xsl:text>
        <xsl:value-of select="@output"/>
        <xsl:text>|</xsl:text>
      </xsl:if>
      <xsl:value-of select="'&#xA;'"/>
      <xsl:value-of select="text()"/>
      <xsl:value-of select="'&#xA;'"/>
      <xsl:call-template name="print-space">
        <xsl:with-param name="i">1</xsl:with-param>
        <xsl:with-param name="count"><xsl:value-of select="$myspace+$myspacemultiplier"/></xsl:with-param>
      </xsl:call-template>
      <xsl:text>end</xsl:text>
    </xsl:if>
  </xsl:template>

  <xsl:template name="print-space">
    <xsl:param name="i"/>
    <xsl:param name="count"/>
    <xsl:if test="$i &lt;= $count">
      <xsl:text> </xsl:text>
      <xsl:call-template name="print-space">
        <xsl:with-param name="i">
          <xsl:value-of select="$i + 1"/>
        </xsl:with-param>
        <xsl:with-param name="count">
          <xsl:value-of select="$count"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>

